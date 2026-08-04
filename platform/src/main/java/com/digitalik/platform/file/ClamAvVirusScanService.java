package com.digitalik.platform.file;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * US-09.7.2: ClamAV'ın ({@code clamd}) "INSTREAM" TCP protokolüyle gerçek
 * zamanlı dosya taraması — bkz. {@code docker-compose.yml}'deki {@code
 * clamav} servisi. Herhangi bir üçüncü parti istemci kütüphanesi
 * KULLANILMADI; protokol yeterince basit (4 bayt big-endian uzunluk
 * öneki + veri parçası, tekrarlı; sıfır-uzunluklu bir parça akışı
 * sonlandırır) olduğundan doğrudan {@code java.net.Socket} ile uygulandı
 * — ekstra bağımlılık gerektirmez.
 */
@Service
public class ClamAvVirusScanService implements VirusScanService {

    private static final int CHUNK_SIZE = 8192;

    private final String host;
    private final int port;

    public ClamAvVirusScanService(@Value("${app.clamav.host}") String host, @Value("${app.clamav.port}") int port) {
        this.host = host;
        this.port = port;
    }

    @Override
    public boolean isInfected(byte[] data) {
        try (Socket socket = new Socket(host, port)) {
            OutputStream out = socket.getOutputStream();
            out.write("zINSTREAM\0".getBytes(StandardCharsets.US_ASCII));

            for (int offset = 0; offset < data.length; offset += CHUNK_SIZE) {
                int length = Math.min(CHUNK_SIZE, data.length - offset);
                out.write(ByteBuffer.allocate(4).order(ByteOrder.BIG_ENDIAN).putInt(length).array());
                out.write(data, offset, length);
            }
            out.write(new byte[] {0, 0, 0, 0});
            out.flush();

            InputStream in = socket.getInputStream();
            String response = new String(in.readAllBytes(), StandardCharsets.US_ASCII);
            return response.contains("FOUND");
        } catch (IOException ex) {
            throw new IllegalStateException("Virüs tarama servisine bağlanılamadı.", ex);
        }
    }
}

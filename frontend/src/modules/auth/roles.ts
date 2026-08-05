// Backend'in auth.entity.Role'ündeki AYNI 4 sabit — bunları LİSTELEYEN bir
// uç YOK (bkz. audit modülündeki entityTypes.ts'teki AYNI gerekçe), bu
// yüzden statik tutulur.
export const KNOWN_ROLES = ['ADMIN', 'IK', 'YONETICI', 'CALISAN'] as const

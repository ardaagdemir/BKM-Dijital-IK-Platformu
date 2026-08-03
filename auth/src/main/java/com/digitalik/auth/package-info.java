/**
 * Kullanıcı girişi ve kimlik doğrulama modülü (bkz. docs/03-product-roadmap.md, Bölüm 2).
 *
 * <p>İçindeki alt paketler katman bazlıdır: {@link com.digitalik.auth.entity},
 * {@link com.digitalik.auth.repository}, {@link com.digitalik.auth.service},
 * {@link com.digitalik.auth.controller}, {@link com.digitalik.auth.dto},
 * {@link com.digitalik.auth.exception}, {@link com.digitalik.auth.config}.
 *
 * <p>Bu, ayrı bir Maven modülüdür ({@code auth/pom.xml}) ve yalnızca {@code core}'a
 * bağımlıdır. Diğer modüller (ör. ileride {@code organization}), bu modülün
 * {@code pom.xml}'inde bir bağımlılık olarak tanımlanmadıkça buradaki hiçbir sınıfa
 * (public olsa bile) erişemez — modül sınırı Maven'in kendisi tarafından, derleme
 * zamanında zorlanır.
 */
package com.digitalik.auth;

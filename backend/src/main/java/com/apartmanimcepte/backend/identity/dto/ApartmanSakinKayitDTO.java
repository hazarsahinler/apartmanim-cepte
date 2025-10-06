package com.apartmanimcepte.backend.identity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApartmanSakinKayitDTO {
    @NotEmpty(message = "İsim boş olamaz")
    private String kullaniciAdi;

    @NotEmpty(message = "Soyisim boş olamaz")
    private String kullaniciSoyadi;

    @NotEmpty(message = "E-posta boş olamaz")
    @Email(message = "Geçerli bir e-posta adresi giriniz")
    private String kullaniciEposta;

    @NotEmpty(message = "Telefon numarası boş olamaz")
    private String kullaniciTelefon;

    @NotNull(message = "Kiracı veya Ev Sahibi")
    private Integer konutKullanim;
    @NotEmpty(message = "Şifre boş olamaz")
    @Size(min = 8, message = "Şifre en az 8 karakter olmalıdır")
    private String kullaniciSifre;

    private long daireId;
}

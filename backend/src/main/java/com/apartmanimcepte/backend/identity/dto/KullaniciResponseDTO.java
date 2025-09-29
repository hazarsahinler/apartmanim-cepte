package com.apartmanimcepte.backend.identity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KullaniciResponseDTO {
    private String kullaniciAdi;
    private String kullaniciSoyadi;
    private String kullaniciEposta;
    private String kullaniciTelefon;
    private String konutKullanim;
    private String ApartmanRol;
}

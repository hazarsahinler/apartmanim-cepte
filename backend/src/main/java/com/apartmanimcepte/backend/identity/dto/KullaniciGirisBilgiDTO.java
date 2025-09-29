package com.apartmanimcepte.backend.identity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class KullaniciGirisBilgiDTO {
    private String kullaniciTelefon;
    private String kullaniciSifre;
}

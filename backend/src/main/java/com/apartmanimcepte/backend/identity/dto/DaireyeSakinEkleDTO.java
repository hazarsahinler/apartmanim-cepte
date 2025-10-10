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
public class DaireyeSakinEkleDTO {


    @NotEmpty(message = "Telefon numarası boş olamaz")
    private String kullaniciTelefon;


    private long daireId;
}


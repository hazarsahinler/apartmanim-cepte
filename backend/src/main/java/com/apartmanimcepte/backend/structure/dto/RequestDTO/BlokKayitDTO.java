package com.apartmanimcepte.backend.structure.dto.RequestDTO;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BlokKayitDTO {

    @NotBlank(message = "Blok ismi boş olamaz")
    private String blokIsmi;

    @Min(value = 1, message = "Kat sayısı en az 1 olmalıdır")
    private int katSayisi;

    @Min(value = 1, message = "Her kattaki daire sayısı en az 1 olmalıdır")
    private int herKattakiDaireSayisi;
}

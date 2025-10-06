package com.apartmanimcepte.backend.structure.dto.RequestDTO;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BlokKayitDTO {

    @NotBlank(message = "Blok ismi boş olamaz")
    private String blokIsmi;

    @NotNull(message = "Kat sayısı boş olamaz")
    @Min(value = 1, message = "Kat sayısı en az 1 olmalıdır")
    private Integer katSayisi;

    @NotNull(message = "Her kattaki daire sayısı boş olamaz")
    @Min(value = 1, message = "Her kattaki daire sayısı en az 1 olmalıdır")
    private Integer herKattakiDaireSayisi;

    @NotNull(message = "Site ID boş olamaz")
    @Min(value = 1, message = "Site ID geçerli olmalıdır")
    private Long siteId;
}
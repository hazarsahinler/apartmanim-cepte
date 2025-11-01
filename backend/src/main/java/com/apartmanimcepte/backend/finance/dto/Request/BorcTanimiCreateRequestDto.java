package com.apartmanimcepte.backend.finance.dto;

import com.apartmanimcepte.backend.finance.Enum.BorcTuruEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BorcTanimiCreateRequestDto {

    @NotNull(message = "Tutar boş olamaz.")
    @Positive(message = "Tutar pozitif bir değer olmalıdır.")
    private BigDecimal tutar;

    @NotNull(message = "Borç türü boş olamaz.")
    private BorcTuruEnum borcTuru;

    @NotBlank(message = "Açıklama boş olamaz.")
    @Size(min = 5, max = 200, message = "Açıklama 5 ile 200 karakter arasında olmalıdır.")
    private String aciklama;

    @NotNull(message = "Son ödeme tarihi boş olamaz.")
    private LocalDate sonOdemeTarihi;

    @NotNull(message = "Site ID boş olamaz.")
    private Long siteId;
}
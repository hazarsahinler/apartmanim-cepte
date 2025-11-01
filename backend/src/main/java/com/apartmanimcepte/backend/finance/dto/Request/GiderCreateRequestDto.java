package com.apartmanimcepte.backend.finance.dto.Request;

import com.apartmanimcepte.backend.finance.Enum.GiderTurEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class GiderCreateRequestDto {

    @NotNull(message = "Gider tutarı boş olamaz.")
    @Positive(message = "Gider tutarı pozitif bir değer olmalıdır.")
    private BigDecimal giderTutari;

    @NotNull(message = "Gider türü boş olamaz.")
    private GiderTurEnum giderTur;

    @NotBlank(message = "Gider açıklaması boş olamaz.")
    private String giderAciklama;

    @NotNull(message = "Site ID boş olamaz.")
    private Long siteId;
}
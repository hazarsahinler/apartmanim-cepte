package com.apartmanimcepte.backend.finance.dto.Response;

import com.apartmanimcepte.backend.finance.Enum.GiderTurEnum;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GiderResponseDto {
    private Long giderId;
    private BigDecimal giderTutari;
    private GiderTurEnum giderTur;
    private String giderAciklama;
    private LocalDate giderOlusturulmaTarihi;
    private Boolean aktif;
    private Long siteId;
}
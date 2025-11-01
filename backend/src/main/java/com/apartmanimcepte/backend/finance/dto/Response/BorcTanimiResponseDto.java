package com.apartmanimcepte.backend.finance.dto.Response;

import com.apartmanimcepte.backend.finance.Enum.BorcTuruEnum;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BorcTanimiResponseDto {
    private Long id;
    private BigDecimal tutar;
    private BorcTuruEnum borcTuru;
    private String aciklama;
    private LocalDate olusturulmaTarihi;
    private LocalDate sonOdemeTarihi;
    private Long siteId;
}
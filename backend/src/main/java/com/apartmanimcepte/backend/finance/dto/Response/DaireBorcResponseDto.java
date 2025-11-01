package com.apartmanimcepte.backend.finance.dto.Response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DaireBorcResponseDto {

    private Long id;
    private BigDecimal tutar;
    private boolean odendiMi;
    private LocalDate odemeTarihi;
    private Long daireId;
    private String daireNo;
    private String borcAciklamasi;
    private LocalDate sonOdemeTarihi;

}

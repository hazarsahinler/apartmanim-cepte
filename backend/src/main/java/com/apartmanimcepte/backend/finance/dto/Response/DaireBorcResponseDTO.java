package com.apartmanimcepte.backend.finance.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DaireBorcResponseDTO {

    private Long id;
    private BigDecimal tutar;
    private boolean odendiMi;
    private LocalDate odemeTarihi;
    private Long daireId;
    private int daireNo;
    private int daireKat;
    private String daireBlok;
    private String borcAciklamasi;
    private LocalDate sonOdemeTarihi;

}

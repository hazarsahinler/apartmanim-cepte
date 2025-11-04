package com.apartmanimcepte.backend.finance.dto.Response;

import com.apartmanimcepte.backend.finance.Enum.BorcTuruEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BorcTanimiResponseDTO {
    private Long id;
    private BigDecimal tutar;
    private BorcTuruEnum borcTuru;
    private String aciklama;
    private LocalDate olusturulmaTarihi;
    private LocalDate sonOdemeTarihi;
    private Long siteId;
}
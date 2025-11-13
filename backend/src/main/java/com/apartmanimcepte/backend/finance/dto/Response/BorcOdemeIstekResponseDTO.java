package com.apartmanimcepte.backend.finance.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BorcOdemeIstekResponseDTO {
    private Long borcOdemeIstekId;
    private Long daireBorcId;
    private Long daireId;
    private int katNo;
    private int daireNo;
    private String blokIsmi;
    private LocalDate istekTarihi;

}

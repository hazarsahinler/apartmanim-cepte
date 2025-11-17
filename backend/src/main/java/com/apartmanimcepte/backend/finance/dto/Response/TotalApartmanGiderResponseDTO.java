package com.apartmanimcepte.backend.finance.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TotalApartmanGiderResponseDTO {
    private BigDecimal tutar;

}

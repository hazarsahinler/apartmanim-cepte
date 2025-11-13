package com.apartmanimcepte.backend.finance.dto.Response;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TotalApartmanGelirResponseDTO {
    private BigDecimal tutar;
}

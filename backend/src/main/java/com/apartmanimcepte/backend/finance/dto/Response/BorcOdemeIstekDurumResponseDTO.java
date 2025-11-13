package com.apartmanimcepte.backend.finance.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BorcOdemeIstekDurumResponseDTO {
    private Boolean onaylandiMi;
    private String message;
}

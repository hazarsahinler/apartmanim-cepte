package com.apartmanimcepte.backend.finance.dto.Request;


import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DaireBorcUpdateRequestDTO {

    @NotNull
    private boolean odendiMi;

    private LocalDate odemeTarihi;
}

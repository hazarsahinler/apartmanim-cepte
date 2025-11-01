package com.apartmanimcepte.backend.finance.dto.Request;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DaireBorcUpdateRequestDto {

    @NotNull
    private boolean odendiMi;

    private LocalDate odemeTarihi;
}

package com.apartmanimcepte.backend.finance.dto.Request;

import com.apartmanimcepte.backend.finance.Enum.BorcTuruEnum;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class TanimlanmisBorcFiltreDTO {

    private BorcTuruEnum borcTuru;
    private Integer yil;
    private Long siteId;
    private Long daireId;

}

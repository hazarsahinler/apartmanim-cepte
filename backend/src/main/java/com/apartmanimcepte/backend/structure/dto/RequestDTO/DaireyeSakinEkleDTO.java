package com.apartmanimcepte.backend.structure.dto.RequestDTO;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DaireyeSakinEkleDTO {
    private long kullaniciId;
    private long daireId;
}
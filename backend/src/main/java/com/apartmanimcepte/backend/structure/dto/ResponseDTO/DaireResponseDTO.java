package com.apartmanimcepte.backend.structure.dto.ResponseDTO;

import com.apartmanimcepte.backend.identity.dto.KullaniciResponseDTO;
import lombok.Data;

import java.util.Set;

@Data
public class DaireResponseDTO {
    private long daireId;
    private int daireNo;
    private int katNo;
    private long blokId;
    Set<KullaniciResponseDTO> kullaniciResponseDTOS;
}

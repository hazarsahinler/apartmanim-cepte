package com.apartmanimcepte.backend.structure.dto.ResponseDTO;

import com.apartmanimcepte.backend.structure.entity.Daire;
import lombok.Data;

import java.util.List;

@Data
public class BlokResponseDTO {
    private long siteId;
    private long blokId;
    private String blokIsmi;
    private int daireSay;

}

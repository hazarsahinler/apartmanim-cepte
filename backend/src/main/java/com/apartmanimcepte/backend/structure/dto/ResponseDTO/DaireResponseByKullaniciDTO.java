package com.apartmanimcepte.backend.structure.dto.ResponseDTO;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DaireResponseByKullaniciDTO {
    private long daireId;
    private int daireNo;
    private int katNo;
    private long blokId;
    private String blokIsmi;
    private long siteId;
    private String siteIsmi;
    private String siteAdresi;
}

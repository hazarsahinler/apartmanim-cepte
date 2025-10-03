package com.apartmanimcepte.backend.structure.dto.ResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SiteResponseDTO {
    private String siteIsmi;
    private String siteIl;
    private String siteIlce;
    private String siteMahalle;
    private String siteSokak;
}

package com.apartmanimcepte.backend.structure.dto.RequestDTO;

import lombok.Data;
import jakarta.validation.constraints.NotEmpty;

@Data
public class SiteKayitDTO {

    @NotEmpty(message = "Site ismi boş olamaz")
    private String siteIsmi;
    private String siteIl;
    private String siteIlce;
    private String siteMahalle;
    private String siteSokak;
    private long yoneticiId;
}

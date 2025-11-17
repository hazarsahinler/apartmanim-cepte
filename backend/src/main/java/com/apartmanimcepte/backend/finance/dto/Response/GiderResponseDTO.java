package com.apartmanimcepte.backend.finance.dto.Response;

import com.apartmanimcepte.backend.finance.Enum.GiderTurEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GiderResponseDTO {
    private Long giderId;
    private BigDecimal giderTutari;
    private GiderTurEnum giderTur;
    private String giderAciklama;
    private LocalDate giderOlusturulmaTarihi;
    private Boolean aktif;
    private Long siteId;
    private String siteIsmi;
    private List<GiderBelgeDTO> belgeler; // Gider belgeleri

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GiderBelgeDTO {
        private Long giderBelgeId;
        private String dosyaAdi;
        private String dosyaTuru; // "PDF", "IMAGE", "OTHER"
        private Long dosyaBoyutu;
        private LocalDateTime yuklemeTarihi;
        private String dosyaUrl; // Download URL
    }
}
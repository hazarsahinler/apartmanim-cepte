package com.apartmanimcepte.backend.announcement.dto.response;

import com.apartmanimcepte.backend.announcement.Enum.OnemSeviyesiEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DuyuruResponseDTO {

    private Long duyuruId;
    private String duyuruMesaji;
    private String duyuruBaslik;
    private LocalDateTime olusturulmaTarihi;
    private Long siteId;
    private String siteIsmi;
    private OnemSeviyesiEnum onemSeviyesi;

    // HQL için özel constructor (başlık olmadan)
    public DuyuruResponseDTO(Long duyuruId, String duyuruMesaji, LocalDateTime olusturulmaTarihi,
                             Long siteId, String siteIsmi, OnemSeviyesiEnum onemSeviyesi) {
        this.duyuruId = duyuruId;
        this.duyuruMesaji = duyuruMesaji;
        this.olusturulmaTarihi = olusturulmaTarihi;
        this.siteId = siteId;
        this.siteIsmi = siteIsmi;
        this.onemSeviyesi = onemSeviyesi;
    }

    // Özet mesaj için (ilk 100 karakter)
    public String getOzetMesaj() {
        if (duyuruMesaji == null) return "";
        return duyuruMesaji.length() > 100
                ? duyuruMesaji.substring(0, 100) + "..."
                : duyuruMesaji;
    }

    // Frontend için önem seviyesi bilgileri
    public String getOnemSeviyesiAciklama() {
        if (onemSeviyesi == null) return "";
        switch (onemSeviyesi) {
            case YUKSEK: return "Yüksek";
            case ORTA: return "Orta";
            case DUSUK: return "Düşük";
            default: return "";
        }
    }

    public String getOnemSeviyesiRenk() {
        if (onemSeviyesi == null) return "#6B7280";
        switch (onemSeviyesi) {
            case YUKSEK: return "#EF4444";  // Kırmızı
            case ORTA: return "#F59E0B";    // Turuncu
            case DUSUK: return "#10B981";   // Yeşil
            default: return "#6B7280";
        }
    }
}
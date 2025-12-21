package com.apartmanimcepte.backend.announcement.Enum;

public enum OnemSeviyesiEnum {
    DUSUK("Düşük", "#10B981"), // Yeşil
    ORTA("Orta", "#F59E0B"),   // Turuncu
    YUKSEK("Yüksek", "#EF4444"); // Kırmızı

    private final String aciklama;
    private final String renk;

    OnemSeviyesiEnum(String aciklama, String renk) {
        this.aciklama = aciklama;
        this.renk = renk;
    }

    public String getAciklama() {
        return aciklama;
    }

    public String getRenk() {
        return renk;
    }

    public static OnemSeviyesiEnum fromString(String text) {
        for (OnemSeviyesiEnum seviye : OnemSeviyesiEnum.values()) {
            if (seviye.name().equalsIgnoreCase(text)) {
                return seviye;
            }
        }
        throw new IllegalArgumentException("Geçersiz önem seviyesi: " + text);
    }
}
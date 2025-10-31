package com.apartmanimcepte.backend.finance.Enum;

public enum GiderTurEnum {
    ELEKTRIK("Elektrik Faturası"),
    SU("Su Faturası"),
    DOGALGAZ("Doğalgaz Faturası"),
    TEMIZLIK("Temizlik Hizmeti"),
    GUVENLIK("Güvenlik Hizmeti"),
    ASANSOR("Asansör Bakım"),
    BAHCE("Bahçe Bakımı"),
    BAKIM_ONARIM("Bakım Onarım"),
    YONETICI_UCRETI("Yönetici Ücreti"),
    SIGORTA("Sigorta Primi"),
    VERGI_HARCI("Vergi ve Harçlar"),
    DIGER("Diğer Giderler");

    private final String aciklama;

    GiderTurEnum(String aciklama) {
        this.aciklama = aciklama;
    }

    public String getAciklama() {
        return aciklama;
    }

    public static GiderTurEnum fromString(String text) {
        for (GiderTurEnum tur : GiderTurEnum.values()) {
            if (tur.name().equalsIgnoreCase(text)) {
                return tur;
            }
        }
        throw new IllegalArgumentException("Geçersiz gider türü: " + text);
    }
}
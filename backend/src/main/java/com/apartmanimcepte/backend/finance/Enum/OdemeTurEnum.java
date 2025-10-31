package com.apartmanimcepte.backend.finance.Enum;

public enum OdemeTurEnum {
    AIDAT("Aylık Aidat"),
    OZEL_MASRAF("Özel Masraf");

    private final String aciklama;

    OdemeTurEnum(String aciklama) {
        this.aciklama = aciklama;
    }

    public String getAciklama() {
        return aciklama;
    }

    public static OdemeTurEnum fromString(String text) {
        for (OdemeTurEnum tur : OdemeTurEnum.values()) {
            if (tur.name().equalsIgnoreCase(text)) {
                return tur;
            }
        }
        throw new IllegalArgumentException("Geçersiz ödeme türü: " + text);
    }
}
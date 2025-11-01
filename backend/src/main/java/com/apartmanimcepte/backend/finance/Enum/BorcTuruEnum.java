package com.apartmanimcepte.backend.finance.Enum;

public enum BorcTuruEnum {
    AIDAT("Aylık Aidat"),
    OZEL_MASRAF("Özel Masraf");

    private final String aciklama;

    BorcTuruEnum(String aciklama) {
        this.aciklama = aciklama;
    }

    public String getAciklama() {
        return aciklama;
    }

    public static BorcTuruEnum fromString(String text) {
        for (BorcTuruEnum tur : BorcTuruEnum.values()) {
            if (tur.name().equalsIgnoreCase(text)) {
                return tur;
            }
        }
        throw new IllegalArgumentException("Geçersiz ödeme türü: " + text);
    }
}
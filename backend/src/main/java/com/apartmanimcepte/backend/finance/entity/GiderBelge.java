package com.apartmanimcepte.backend.finance.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "GiderBelge")
public class GiderBelge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "gider_belge_id")
    private Long giderBelgeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gider_id", nullable = false)
    private Gider gider;

    @Column(name = "dosya_adi")
    private String dosyaAdi;

    @Column(name = "dosya_yolu")
    private String dosyaYolu;

    @Column(name = "dosya_turu") // "PDF", "JPG", "PNG"
    private String dosyaTuru;

    @Column(name = "dosya_boyutu")
    private Long dosyaBoyutu; // Byte cinsinden

    @Column(name = "yukleme_tarihi")
    private LocalDateTime yuklemeTarihi;

    @Column(name = "aktif")
    private Boolean aktif = true;
}
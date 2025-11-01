package com.apartmanimcepte.backend.finance.entity;

import com.apartmanimcepte.backend.finance.Enum.BorcTuruEnum; // AlacakTurEnum'u BorcTuruEnum olarak yeniden isimlendirmek daha mantıklı
import com.apartmanimcepte.backend.structure.entity.Site;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "BorcTanimi") // Tablo adını daha anlaşılır yapalım
public class BorcTanimi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "borc_tanim_id")
    private Long id;

    @Column(name = "tutar")
    private BigDecimal tutar;

    @Column(name = "borc_turu")
    @Enumerated(EnumType.STRING)
    private BorcTuruEnum borcTuru; // Örn: AIDAT, EK_ODEME

    @Column(name = "aciklama")
    private String aciklama; // Örn: "Kasım 2025 Aidatı"

    @Column(name = "olusturulma_tarihi")
    private LocalDate olusturulmaTarihi;

    @Column(name = "son_odeme_tarihi")
    private LocalDate sonOdemeTarihi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;
}
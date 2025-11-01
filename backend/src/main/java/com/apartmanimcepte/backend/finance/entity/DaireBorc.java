package com.apartmanimcepte.backend.finance.entity;

import com.apartmanimcepte.backend.structure.entity.Daire;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "DaireBorc")
public class DaireBorc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "daire_borc_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "daire_id", nullable = false)
    private Daire daire;

    @ManyToOne
    @JoinColumn(name = "borc_tanim_id", nullable = false)
    private BorcTanimi borcTanimi;

    @Column(name = "tutar")
    private BigDecimal tutar;

    @Column(name = "odendi_mi")
    private boolean odendiMi = false; // Varsayılan olarak ödenmedi

    @Column(name = "odeme_tarihi")
    private LocalDate odemeTarihi; // Ödendiğinde bu alan doldurulur
}
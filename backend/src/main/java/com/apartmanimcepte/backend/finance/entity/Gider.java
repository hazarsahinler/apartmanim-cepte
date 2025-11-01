package com.apartmanimcepte.backend.finance.entity;

import com.apartmanimcepte.backend.finance.Enum.GiderTurEnum;
import com.apartmanimcepte.backend.structure.entity.Site;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "Gider")
public class Gider {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "gider_id")
    private long giderId;

    @Column(name = "gider_tutari")
    private BigDecimal giderTutari;

    @Column(name = "gider_tur")
    @Enumerated(EnumType.STRING)
    private GiderTurEnum giderTur;

    @Column(name = "gider_aciklamasi")
    private String giderAciklama;

    @Column(name = "gider_olusturulma_tarihi")
    private LocalDate giderOlusturulmaTarihi;

    @Column(name = "aktif")
    private Boolean aktif = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

}
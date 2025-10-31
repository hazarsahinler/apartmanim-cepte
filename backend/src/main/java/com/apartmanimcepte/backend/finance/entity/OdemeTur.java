package com.apartmanimcepte.backend.finance.entity;

import com.apartmanimcepte.backend.finance.Enum.OdemeTurEnum;
import com.apartmanimcepte.backend.structure.entity.Blok;
import com.apartmanimcepte.backend.structure.entity.Site;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "OdemeTur")
public class OdemeTur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "odeme_tur_id")
    private long odemeTurId;

    @Column(name = "odeme_tutari")
    private BigDecimal odemeTutari;

    @Column(name = "odeme_tur")
    @Enumerated(EnumType.STRING)
    private OdemeTurEnum odemeTur;

    @Column(name = "odeme_aciklamasi")
    private String odemeAciklama;

    @Column(name = "odeme_olusturulma_tarihi")
    private LocalDate odemeOlusturulmaTarihi;

    @Column(name = "son_odeme_tarihi")
    private LocalDate sonOdemeTarihi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;


}

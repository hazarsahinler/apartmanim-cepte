package com.apartmanimcepte.backend.structure.entity;

import com.apartmanimcepte.backend.identity.entity.Kullanici;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "daireler") // Standart: küçük harf ve çoğul
public class Daire {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long daireId;

    @Column(name = "daire_no")
    private int daireNo;

    @Column(name = "kat_no")
    private int katNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blok_id", nullable = false)
    private Blok blok;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kullanici_id", nullable = true)
    private Kullanici kullanici;
}
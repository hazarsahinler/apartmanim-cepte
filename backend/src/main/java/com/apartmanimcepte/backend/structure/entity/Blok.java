package com.apartmanimcepte.backend.structure.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "Bloklar")
public class Blok {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "blok_id")
    private long blokId;

    @Column(name = "blok_ismi")
    private String blokIsmi;

    @ManyToOne
    @JoinColumn(name = "site_id")
    private Site site;
}

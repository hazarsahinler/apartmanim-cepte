package com.apartmanimcepte.backend.finance.dao;

import com.apartmanimcepte.backend.finance.dto.Response.TotalApartmanGelirResponseDTO;
import com.apartmanimcepte.backend.finance.dto.Response.TotalApartmanGiderResponseDTO;
import com.apartmanimcepte.backend.identity.dao.BaseDAO;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.stereotype.Repository;

@Repository

public class GiderBelgeDAO extends BaseDAO {
    private final SessionFactory sessionFactory;

    public GiderBelgeDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }

}

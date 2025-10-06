package com.apartmanimcepte.backend.structure.dao;

import com.apartmanimcepte.backend.identity.dao.BaseDAO;
import org.hibernate.SessionFactory;
import org.springframework.stereotype.Repository;

@Repository
public class DaireDAO extends BaseDAO {
    private final SessionFactory sessionFactory;
    public DaireDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }
}

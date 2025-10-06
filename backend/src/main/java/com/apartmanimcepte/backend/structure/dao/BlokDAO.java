package com.apartmanimcepte.backend.structure.dao;

import com.apartmanimcepte.backend.identity.dao.BaseDAO;
import org.hibernate.SessionFactory;
import org.springframework.stereotype.Repository;

@Repository
public class BlokDAO extends BaseDAO {
    private final SessionFactory sessionFactory;
    public BlokDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }
}

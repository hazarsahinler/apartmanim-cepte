package com.apartmanimcepte.backend.finance.dao;

import com.apartmanimcepte.backend.identity.dao.BaseDAO;
import org.hibernate.SessionFactory;
import org.springframework.stereotype.Repository;

@Repository
public class BorcTanimiDAO extends BaseDAO {
    private final SessionFactory sessionFactory;
    public BorcTanimiDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }

}

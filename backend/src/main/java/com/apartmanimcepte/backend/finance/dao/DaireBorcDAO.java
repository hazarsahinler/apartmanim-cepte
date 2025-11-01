package com.apartmanimcepte.backend.finance.dao;

import com.apartmanimcepte.backend.identity.dao.BaseDAO;
import org.hibernate.SessionFactory;
import org.springframework.stereotype.Repository;

@Repository
public class DaireBorcDAO extends BaseDAO {
    private final SessionFactory sessionFactory;
    public DaireBorcDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }
}

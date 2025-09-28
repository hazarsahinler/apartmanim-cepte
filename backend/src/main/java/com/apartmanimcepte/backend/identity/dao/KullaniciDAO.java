package com.apartmanimcepte.backend.identity.dao;

import org.hibernate.SessionFactory;
import org.springframework.stereotype.Repository;

@Repository
public class KullaniciDAO extends BaseDAO {

    public KullaniciDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
    }
}

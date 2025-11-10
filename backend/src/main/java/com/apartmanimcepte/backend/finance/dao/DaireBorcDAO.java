package com.apartmanimcepte.backend.finance.dao;

import com.apartmanimcepte.backend.finance.dto.Request.TanimlanmisBorcFiltreDTO;
import com.apartmanimcepte.backend.finance.dto.Response.BorcTanimiResponseDTO;
import com.apartmanimcepte.backend.finance.dto.Response.DaireBorcResponseDTO;
import com.apartmanimcepte.backend.identity.dao.BaseDAO;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public class DaireBorcDAO extends BaseDAO {
    private final SessionFactory sessionFactory;

    public DaireBorcDAO(SessionFactory sessionFactory) {
        super(sessionFactory);
        this.sessionFactory = sessionFactory;
    }

    public List<DaireBorcResponseDTO> getDaireBorc(Long daireId) {
        StringBuilder hql = new StringBuilder();

        hql.append(" SELECT NEW com.apartmanimcepte.backend.finance.dto.Response.DaireBorcResponseDTO( ");
        hql.append("   d.id, d.tutar,d.odendiMi,d.odemeTarihi,d.daire.daireId,d.daire.daireNo,d.daire.katNo,d.daire.blok.blokIsmi,d.borcTanimi.aciklama,d.borcTanimi.sonOdemeTarihi ");
        hql.append(" ) ");
        hql.append(" FROM DaireBorc d WHERE 1=1 ");

        if (daireId != null) {
            hql.append(" AND d.daire.daireId= :daireId ");
        }


        Query<DaireBorcResponseDTO> query = sessionFactory.getCurrentSession().createQuery(hql.toString(), DaireBorcResponseDTO.class);

        if (daireId != null) {
            query.setParameter("daireId", daireId);
        }


        return query.list();
    }
}

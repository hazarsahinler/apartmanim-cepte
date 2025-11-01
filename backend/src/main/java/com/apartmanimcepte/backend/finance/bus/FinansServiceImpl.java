package com.apartmanimcepte.backend.finance.bus;

import com.apartmanimcepte.backend.finance.dao.BorcTanimiDAO;
import com.apartmanimcepte.backend.finance.dao.DaireBorcDAO;
import com.apartmanimcepte.backend.finance.dto.BorcTanimiCreateRequestDto;
import com.apartmanimcepte.backend.finance.entity.BorcTanimi;
import com.apartmanimcepte.backend.finance.entity.DaireBorc;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import com.apartmanimcepte.backend.structure.dao.DaireDAO;
import com.apartmanimcepte.backend.structure.dao.SiteDAO;
import com.apartmanimcepte.backend.structure.entity.Daire;
import com.apartmanimcepte.backend.structure.entity.Site;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class FinansServiceImpl implements FinansService {

    private final SiteDAO siteDAO;
    private final DaireDAO daireDAO;
    private final DaireBorcDAO daireBorcDAO;
    private final BorcTanimiDAO borcTanimiDAO;

    public FinansServiceImpl(SiteDAO siteDAO, DaireDAO daireDAO, DaireBorcDAO daireBorcDAO, BorcTanimiDAO borcTanimiDAO) {
        this.siteDAO = siteDAO;
        this.daireDAO = daireDAO;

        this.daireBorcDAO = daireBorcDAO;
        this.borcTanimiDAO = borcTanimiDAO;
    }

    @Override
    @Transactional
    public ResponseDTO borcTanim(BorcTanimiCreateRequestDto borcTanimiCreateRequestDto) {
        BorcTanimi borcTanimi = new BorcTanimi();
        Site site = siteDAO.getObjectById(Site.class, borcTanimiCreateRequestDto.getSiteId());
        borcTanimi.setSite(site);
        borcTanimi.setBorcTuru(borcTanimiCreateRequestDto.getBorcTuru());
        borcTanimi.setTutar(borcTanimiCreateRequestDto.getTutar());
        borcTanimi.setAciklama(borcTanimiCreateRequestDto.getAciklama());
        borcTanimi.setOlusturulmaTarihi(LocalDate.now());
        borcTanimi.setSonOdemeTarihi(borcTanimiCreateRequestDto.getSonOdemeTarihi());
        borcTanimiDAO.saveOrUpdate(borcTanimi);
        List<Long> daireIdList = daireDAO.getDaireIdsBySiteId(site.getSiteId());
        for (Long daireId : daireIdList) {
            Daire daire = daireDAO.getObjectById(Daire.class, daireId);
            DaireBorc daireBorc = new DaireBorc();
            daireBorc.setDaire(daire);
            daireBorc.setBorcTanimi(borcTanimi);
            daireBorc.setTutar(borcTanimiCreateRequestDto.getTutar());
            daireBorcDAO.saveOrUpdate(daireBorc);

        }
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setMessage("Ödeme bilgisi başarılı bir şekilde eklendi.");
        return responseDTO;
    }
}

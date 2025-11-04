package com.apartmanimcepte.backend.finance.bus;

import com.apartmanimcepte.backend.finance.Enum.BorcTuruEnum;
import com.apartmanimcepte.backend.finance.dao.BorcTanimiDAO;
import com.apartmanimcepte.backend.finance.dao.DaireBorcDAO;
import com.apartmanimcepte.backend.finance.dto.Request.BorcTanimiCreateRequestDTO;
import com.apartmanimcepte.backend.finance.dto.Request.TanimlanmisBorcFiltreDTO;
import com.apartmanimcepte.backend.finance.dto.Response.BorcTanimiResponseDTO;
import com.apartmanimcepte.backend.finance.entity.BorcTanimi;
import com.apartmanimcepte.backend.finance.entity.DaireBorc;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import com.apartmanimcepte.backend.structure.dao.DaireDAO;
import com.apartmanimcepte.backend.structure.dao.SiteDAO;
import com.apartmanimcepte.backend.structure.entity.Daire;
import com.apartmanimcepte.backend.structure.entity.Site;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
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
    public ResponseDTO borcTanim(BorcTanimiCreateRequestDTO borcTanimiCreateRequestDto) {
        BorcTanimi borcTanimi = new BorcTanimi();
        BorcTuruEnum borcTuruEnum = BorcTuruEnum.AIDAT;
        BigDecimal bolunMusBorc = new BigDecimal(0);
        Site site = siteDAO.getObjectById(Site.class, borcTanimiCreateRequestDto.getSiteId());
        borcTanimi.setSite(site);
        borcTanimi.setBorcTuru(borcTanimiCreateRequestDto.getBorcTuru());
        borcTanimi.setTutar(borcTanimiCreateRequestDto.getTutar());
        borcTanimi.setAciklama(borcTanimiCreateRequestDto.getAciklama());
        borcTanimi.setOlusturulmaTarihi(LocalDate.now());
        borcTanimi.setSonOdemeTarihi(borcTanimiCreateRequestDto.getSonOdemeTarihi());
        borcTanimiDAO.saveOrUpdate(borcTanimi);
        List<Long> daireIdList = daireDAO.getDaireIdsBySiteId(site.getSiteId());
        //eğer aidat ise bu çalışacak ve girilen tutar direkt dairelere yansıyacak.
        if (borcTanimiCreateRequestDto.getBorcTuru().equals(borcTuruEnum) ) {
            for (Long daireId : daireIdList) {
                Daire daire = daireDAO.getObjectById(Daire.class, daireId);
                DaireBorc daireBorc = new DaireBorc();
                daireBorc.setDaire(daire);
                daireBorc.setBorcTanimi(borcTanimi);
                daireBorc.setTutar(borcTanimiCreateRequestDto.getTutar());
                daireBorcDAO.saveOrUpdate(daireBorc);

            }
        } else {//eğer girilen aidat değil özel masrafsa (örneğin dış cephe tamiratı gibi) tüm dairelere eşit bölünür set edilir.
            int size = daireIdList.size();
            bolunMusBorc = borcTanimiCreateRequestDto.getTutar() ;
            bolunMusBorc = bolunMusBorc.divide(BigDecimal.valueOf(size),2, RoundingMode.HALF_UP);
            for (Long daireId : daireIdList) {
                Daire daire = daireDAO.getObjectById(Daire.class, daireId);
                DaireBorc daireBorc = new DaireBorc();
                daireBorc.setDaire(daire);
                daireBorc.setBorcTanimi(borcTanimi);
                daireBorc.setTutar(bolunMusBorc);
                daireBorcDAO.saveOrUpdate(daireBorc);

            }
        }

        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setMessage("Ödeme bilgisi başarılı bir şekilde eklendi.");
        return responseDTO;
    }

    @Override
    @Transactional
    public List<BorcTanimiResponseDTO> tanimlananBorclar(TanimlanmisBorcFiltreDTO tanimlanmisBorcFiltreDTO) {
        return borcTanimiDAO.getTanimlananBorclar(tanimlanmisBorcFiltreDTO);
    }
}

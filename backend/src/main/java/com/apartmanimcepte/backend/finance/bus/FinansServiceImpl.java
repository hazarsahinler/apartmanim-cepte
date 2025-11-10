package com.apartmanimcepte.backend.finance.bus;

import com.apartmanimcepte.backend.finance.Enum.BorcTuruEnum;
import com.apartmanimcepte.backend.finance.dao.BorcOdemeIsteklerDAO;
import com.apartmanimcepte.backend.finance.dao.BorcTanimiDAO;
import com.apartmanimcepte.backend.finance.dao.DaireBorcDAO;
import com.apartmanimcepte.backend.finance.dto.Request.BorcTanimiCreateRequestDTO;
import com.apartmanimcepte.backend.finance.dto.Request.TanimlanmisBorcFiltreDTO;
import com.apartmanimcepte.backend.finance.dto.Response.BorcOdemeIstekResponseDTO;
import com.apartmanimcepte.backend.finance.dto.Response.BorcTanimiResponseDTO;
import com.apartmanimcepte.backend.finance.dto.Response.DaireBorcResponseDTO;
import com.apartmanimcepte.backend.finance.entity.BorcOdemeIstekler;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FinansServiceImpl implements FinansService {

    private final SiteDAO siteDAO;
    private final DaireDAO daireDAO;
    private final DaireBorcDAO daireBorcDAO;
    private final BorcTanimiDAO borcTanimiDAO;
    private final BorcOdemeIsteklerDAO borcOdemeIsteklerDAO;

    public FinansServiceImpl(SiteDAO siteDAO, DaireDAO daireDAO, DaireBorcDAO daireBorcDAO, BorcTanimiDAO borcTanimiDAO, BorcOdemeIsteklerDAO borcOdemeIsteklerDAO, BorcOdemeIsteklerDAO borcOdemeIsteklerDAO1) {
        this.siteDAO = siteDAO;
        this.daireDAO = daireDAO;

        this.daireBorcDAO = daireBorcDAO;
        this.borcTanimiDAO = borcTanimiDAO;
        this.borcOdemeIsteklerDAO = borcOdemeIsteklerDAO1;
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
        if (borcTanimiCreateRequestDto.getBorcTuru().equals(borcTuruEnum)) {
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
            bolunMusBorc = borcTanimiCreateRequestDto.getTutar();
            bolunMusBorc = bolunMusBorc.divide(BigDecimal.valueOf(size), 2, RoundingMode.HALF_UP);
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

    @Override
    @Transactional
    public List<DaireBorcResponseDTO> daireBorclar(Long borcId) {
        BorcTanimi borcTanimi = borcTanimiDAO.getObjectById(BorcTanimi.class, borcId);
        List<DaireBorc> daireBorcs = daireBorcDAO.getObjectsByParam(DaireBorc.class, "borcTanimi", borcTanimi);
        List<DaireBorcResponseDTO> daireBorcResponseDTOS = new ArrayList<>();
        for (DaireBorc daireBorc : daireBorcs) {
            Daire daire = daireDAO.getObjectById(Daire.class, daireBorc.getDaire().getDaireId());
            DaireBorcResponseDTO daireBorcResponseDTO = new DaireBorcResponseDTO();
            daireBorcResponseDTO.setId(daireBorc.getId());
            daireBorcResponseDTO.setDaireNo(daireBorc.getDaire().getDaireNo());
            daireBorcResponseDTO.setTutar(daireBorc.getTutar());
            daireBorcResponseDTO.setDaireId(daireBorc.getDaire().getDaireId());
            daireBorcResponseDTO.setDaireKat(daire.getKatNo());
            daireBorcResponseDTO.setDaireBlok(daire.getBlok().getBlokIsmi());
            daireBorcResponseDTO.setBorcAciklamasi(borcTanimi.getAciklama());
            daireBorcResponseDTO.setSonOdemeTarihi(borcTanimi.getSonOdemeTarihi());
            daireBorcResponseDTO.setOdemeTarihi(daireBorc.getOdemeTarihi());
            daireBorcResponseDTO.setOdendiMi(daireBorc.isOdendiMi());
            daireBorcResponseDTOS.add(daireBorcResponseDTO);
        }

        return daireBorcResponseDTOS;
    }

    @Override
    @Transactional
    public List<DaireBorcResponseDTO> daireBorc(Long daireId) {
        return daireBorcDAO.getDaireBorc(daireId);
    }

    @Override
    @Transactional
    public ResponseDTO borcIstekKabul(Long daireBorcId) {
        DaireBorc daireBorc = daireBorcDAO.getObjectById(DaireBorc.class, daireBorcId);
        List<BorcOdemeIstekler> borcOdemeIstekler = borcOdemeIsteklerDAO.getObjectsByParam(BorcOdemeIstekler.class, "daireBorc", daireBorc);
        BorcOdemeIstekler borcOdemeIstekler1 = borcOdemeIstekler.get(0);
        ResponseDTO responseDTO = new ResponseDTO();
        if (daireBorc.isOdendiMi()) {
            responseDTO.setMessage("Seçilen dairenin borcu ödenmiş.");
        } else {
            borcOdemeIstekler1.setOnaylandiMi(true);
            borcOdemeIstekler1.setOnayTarihi(LocalDate.now());
            daireBorc.setOdendiMi(true);
            daireBorc.setOdemeTarihi(borcOdemeIstekler1.getIstekTarihi());
            daireBorcDAO.saveOrUpdate(daireBorc);
            borcOdemeIsteklerDAO.saveOrUpdate(borcOdemeIstekler1);
            responseDTO.setMessage("Borc odeme işlemi başarılı şekilde onaylanmıştır.");
        }
        return responseDTO;
    }

    @Override
    @Transactional
    public ResponseDTO borcOdemeIstegiGonder(Long daireBorcId) {
        ResponseDTO responseDTO = new ResponseDTO();
        DaireBorc daireBorc = daireBorcDAO.getObjectById(DaireBorc.class, daireBorcId);
        if (daireBorc.isOdendiMi()) {
            responseDTO.setMessage("Bu borç zaten ödenmiş durumdadır.");
            return responseDTO;
        }
        Optional<BorcOdemeIstekler> existingRequest = borcOdemeIsteklerDAO.findPendingRequestByDaireBorc(daireBorc);

        if (existingRequest.isPresent()) {
            responseDTO.setMessage("Bu borç için zaten bir ödeme onayı bekleniyor.");
            return responseDTO;
        }

        BorcOdemeIstekler borcOdemeIstekler = new BorcOdemeIstekler();
        borcOdemeIstekler.setDaireBorc(daireBorc);
        borcOdemeIstekler.setIstekTarihi(LocalDate.now());
        borcOdemeIsteklerDAO.saveOrUpdate(borcOdemeIstekler);

        responseDTO.setMessage("Borç ödeme isteğiniz yöneticinize iletildi. Onaylandıktan sonra 'Ödendi' olarak yansıyacaktır.");
        return responseDTO;
    }

    @Override
    @Transactional
    public List<BorcOdemeIstekResponseDTO> borcOdemeIstekler(Long siteId) {
        return borcOdemeIsteklerDAO.getOdemeIstekler(siteId);
    }


}

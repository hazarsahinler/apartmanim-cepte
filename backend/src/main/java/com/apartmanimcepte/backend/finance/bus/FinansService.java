package com.apartmanimcepte.backend.finance.bus;

import com.apartmanimcepte.backend.finance.dto.Request.BorcTanimiCreateRequestDTO;
import com.apartmanimcepte.backend.finance.dto.Request.TanimlanmisBorcFiltreDTO;
import com.apartmanimcepte.backend.finance.dto.Response.BorcOdemeIstekResponseDTO;
import com.apartmanimcepte.backend.finance.dto.Response.BorcTanimiResponseDTO;
import com.apartmanimcepte.backend.finance.dto.Response.DaireBorcResponseDTO;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import com.apartmanimcepte.backend.structure.entity.Daire;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface FinansService {
    ResponseDTO borcTanim(BorcTanimiCreateRequestDTO borcTanimiCreateRequestDto);
    List<BorcTanimiResponseDTO> tanimlananBorclar(TanimlanmisBorcFiltreDTO tanimlanmisBorcFiltreDTO);
    List<DaireBorcResponseDTO> daireBorclar(Long borcId);
    List<DaireBorcResponseDTO> daireBorc(Long daireId);
    ResponseDTO borcIstekKabul (Long daireBorcId);
    ResponseDTO borcOdemeIstegiGonder (Long daireBorcId);
    List<BorcOdemeIstekResponseDTO> borcOdemeIstekler(Long siteId);



}

package com.apartmanimcepte.backend.finance.bus;

import com.apartmanimcepte.backend.finance.dto.BorcTanimiCreateRequestDto;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;

public interface FinansService {
    ResponseDTO borcTanim(BorcTanimiCreateRequestDto borcTanimiCreateRequestDto);
}

package com.vehicle.service.controller;
import com.vehicle.service.model.*;
import com.vehicle.service.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.io.IOException;

@RestController @RequestMapping("/api/registry")
public class RegistryController {
    @Autowired private MechanicRepository mechanicRepo;
    @Autowired private MerchantRepository merchantRepo;
    @Autowired private EmployeeRepository employeeRepo;
    @Autowired private GarageRepository garageRepo;

    @GetMapping("/mechanics") public List<Mechanic> getMechanics() { return mechanicRepo.findAll(); }
    @PostMapping("/mechanics") public Mechanic addMechanic(@RequestBody Mechanic m) { return mechanicRepo.save(m); }
    @DeleteMapping("/mechanics/{id}") public ResponseEntity<?> deleteMechanic(@PathVariable Long id) {
        mechanicRepo.deleteById(id); return ResponseEntity.ok().build();
    }

    @GetMapping("/merchants") public List<Merchant> getMerchants() { return merchantRepo.findAll(); }
    @PostMapping("/merchants") public Merchant addMerchant(@RequestBody Merchant m) { return merchantRepo.save(m); }
    @DeleteMapping("/merchants/{id}") public ResponseEntity<?> deleteMerchant(@PathVariable Long id) {
        merchantRepo.deleteById(id); return ResponseEntity.ok().build();
    }

    @GetMapping("/garages") public List<Garage> getGarages() { return garageRepo.findAll(); }
    @PostMapping("/garages") public Garage saveGarage(@RequestBody Garage g) { 
        garageRepo.deleteAll(); // Keep single garage logic
        return garageRepo.save(g); 
    }

    @GetMapping("/employees") public List<Employee> getEmployees() { return employeeRepo.findAll(); }
    @PostMapping("/employees") 
    public Employee addEmployee(
        @RequestParam("name") String name,
        @RequestParam("post") String post,
        @RequestParam("salary") Double salary,
        @RequestParam("phone") String phone,
        @RequestParam("email") String email,
        @RequestParam("address") String address,
        @RequestParam(value="aadharCard", required=false) MultipartFile aadharCard,
        @RequestParam(value="panCard", required=false) MultipartFile panCard,
        @RequestParam(value="resume", required=false) MultipartFile resume,
        @RequestParam(value="photo", required=false) MultipartFile photo,
        @RequestParam(value="bankPassbook", required=false) MultipartFile bankPassbook,
        @RequestParam(value="experienceLetter", required=false) MultipartFile experienceLetter
    ) throws IOException { 
        Employee e = new Employee();
        e.setName(name); e.setPost(post); e.setSalary(salary); e.setPhone(phone); e.setEmail(email); e.setAddress(address);
        if(aadharCard != null) e.setAadharCard(aadharCard.getBytes());
        if(panCard != null) e.setPanCard(panCard.getBytes());
        if(resume != null) e.setResume(resume.getBytes());
        if(photo != null) e.setPhoto(photo.getBytes());
        if(bankPassbook != null) e.setBankPassbook(bankPassbook.getBytes());
        if(experienceLetter != null) e.setExperienceLetter(experienceLetter.getBytes());
        return employeeRepo.save(e); 
    }
    @DeleteMapping("/employees/{id}") public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        employeeRepo.deleteById(id); return ResponseEntity.ok().build();
    }
}

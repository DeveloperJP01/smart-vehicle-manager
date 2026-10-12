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
    @Autowired private VendorRepository vendorRepo;
    @Autowired private EmployeeRepository employeeRepo;
    @Autowired private GarageRepository garageRepo;

    @GetMapping("/mechanics") public List<Mechanic> getMechanics() { return mechanicRepo.findAll(); }
    @PostMapping("/mechanics") public Mechanic addMechanic(@RequestBody Mechanic m) { return mechanicRepo.save(m); }
    @DeleteMapping("/mechanics/{id}") public ResponseEntity<?> deleteMechanic(@PathVariable Long id) {
        mechanicRepo.deleteById(id); return ResponseEntity.ok().build();
    }

    @GetMapping("/vendors") public List<Vendor> getVendors() { return vendorRepo.findAll(); }
    @PostMapping("/vendors") public Vendor addVendor(@RequestBody Vendor v) { return vendorRepo.save(v); }
    @PutMapping("/vendors/{id}") public ResponseEntity<Vendor> updateVendor(@PathVariable Long id, @RequestBody Vendor v) {
        return vendorRepo.findById(id).map(ex -> {
            ex.setName(v.getName());
            ex.setPhoneNumber(v.getPhoneNumber());
            ex.setEmail(v.getEmail());
            ex.setAddress(v.getAddress());
            ex.setSite(v.getSite());
            return ResponseEntity.ok(vendorRepo.save(ex));
        }).orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/vendors/{id}") public ResponseEntity<?> deleteVendor(@PathVariable Long id) {
        vendorRepo.deleteById(id); return ResponseEntity.ok().build();
    }

    @GetMapping("/garages") public List<Garage> getGarages() { return garageRepo.findAll(); }
    @PostMapping("/garages") public Garage saveGarage(@RequestBody Garage g) { 
        List<Garage> list = garageRepo.findAll();
        if (!list.isEmpty()) {
            Garage ex = list.get(0);
            ex.setName(g.getName());
            ex.setBranchName(g.getBranchName());
            ex.setAddress(g.getAddress());
            ex.setPhone(g.getPhone());
            ex.setEmail(g.getEmail());
            ex.setGstin(g.getGstin());
            return garageRepo.save(ex);
        }
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
    @PostMapping("/employees/{id}") 
    public ResponseEntity<Employee> updateEmployee(
        @PathVariable Long id,
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
        return employeeRepo.findById(id).map(e -> {
            e.setName(name); e.setPost(post); e.setSalary(salary); e.setPhone(phone); e.setEmail(email); e.setAddress(address);
            try {
                if(aadharCard != null && !aadharCard.isEmpty()) e.setAadharCard(aadharCard.getBytes());
                if(panCard != null && !panCard.isEmpty()) e.setPanCard(panCard.getBytes());
                if(resume != null && !resume.isEmpty()) e.setResume(resume.getBytes());
                if(photo != null && !photo.isEmpty()) e.setPhoto(photo.getBytes());
                if(bankPassbook != null && !bankPassbook.isEmpty()) e.setBankPassbook(bankPassbook.getBytes());
                if(experienceLetter != null && !experienceLetter.isEmpty()) e.setExperienceLetter(experienceLetter.getBytes());
            } catch(IOException ex) {
                throw new RuntimeException(ex);
            }
            return ResponseEntity.ok(employeeRepo.save(e));
        }).orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/employees/{id}") public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        employeeRepo.deleteById(id); return ResponseEntity.ok().build();
    }
}
